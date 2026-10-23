import type { PerpsCredentials } from '@polymarket/bindings/perps';
import {
  expectEvmAddress,
  expectEvmSignature,
  expectPrivateKey,
} from '@polymarket/types';
import { describe, expect, it, vi } from 'vitest';
import type { BaseSecureClient } from '../clients';
import { production } from '../environments';
import { openPerpsSession, PerpsCredentialsCleanupError } from './perps';

const signerAddress = expectEvmAddress(
  '0x0000000000000000000000000000000000000001',
);
const existingProxy = expectEvmAddress(
  '0x7e5f4552091a69125d5dfcb7b8c2659029395bdf',
);
const existingPrivateKey = expectPrivateKey(`0x${'0'.repeat(63)}1`);
const signature = expectEvmSignature(`0x${'1'.repeat(130)}`);
const sessionExpiry = Date.now() + 60 * 60_000;

describe('Perps session credential cleanup', () => {
  it('revokes new credentials if credential validation fails', async () => {
    const validationError = new Error('Credential validation failed.');
    const { client, del, connect, proxy, revokedProxies } = createClient({
      validationError,
    });

    await expect(openPerpsSession(client)).rejects.toBe(validationError);

    expect(del).toHaveBeenCalledOnce();
    expect(revokedProxies).toEqual([proxy()]);
    expect(connect).not.toHaveBeenCalled();
  });

  it('revokes new credentials if the Perps stream fails to connect', async () => {
    const connectionError = new Error('Perps stream setup failed.');
    const { client, del, connect, proxy, revokedProxies } = createClient({
      connectError: connectionError,
    });

    await expect(openPerpsSession(client)).rejects.toBe(connectionError);

    expect(connect).toHaveBeenCalledOnce();
    expect(del).toHaveBeenCalledOnce();
    expect(revokedProxies).toEqual([proxy()]);
  });

  it('returns the proxy address when cleanup also fails', async () => {
    const connectionError = new Error('Perps stream setup failed.');
    const { client, del, proxy } = createClient({
      connectError: connectionError,
      revokeError: new Error('Credential revocation failed.'),
    });

    const error = await openPerpsSession(client).then(
      () => undefined,
      (cause: unknown) => cause,
    );

    expect(error).toBeInstanceOf(PerpsCredentialsCleanupError);
    expect(error).toMatchObject({
      cause: connectionError,
      cleanupStatus: 'failed',
      proxy: proxy(),
    });
    expect(error).not.toHaveProperty('privateKey');
    expect(error).not.toHaveProperty('secret');
    expect(del).toHaveBeenCalledOnce();
  });

  it('does not revoke credentials supplied to resume a session', async () => {
    const connectionError = new Error('Perps stream setup failed.');
    const existingCredentials: PerpsCredentials = {
      expiresAt: sessionExpiry,
      privateKey: existingPrivateKey,
      proxy: existingProxy,
      secret: 'existing-session-secret',
    };
    const { client, del } = createClient({
      connectError: connectionError,
      existingProxy,
      existingExpiry: existingCredentials.expiresAt,
    });

    await expect(
      openPerpsSession(client, { credentials: existingCredentials }),
    ).rejects.toBe(connectionError);

    expect(del).not.toHaveBeenCalled();
  });
});

function createClient(
  options: {
    connectError?: unknown;
    existingExpiry?: number;
    existingProxy?: string;
    revokeError?: unknown;
    validationError?: unknown;
  } = {},
) {
  let proxy = options.existingProxy;
  let expiresAt = options.existingExpiry ?? sessionExpiry;
  const revokedProxies: string[] = [];

  const post = vi.fn(
    async (
      _path: string,
      request: {
        json: {
          op: {
            args: {
              expiry: number;
              proxy: string;
            };
          };
        };
      },
    ) => {
      proxy = request.json.op.args.proxy;
      expiresAt = request.json.op.args.expiry;
      return { secret: 'new-session-secret' };
    },
  );
  const getWorkflow = vi.fn(async () => {
    if (options.validationError !== undefined) {
      throw options.validationError;
    }
    return {
      address: signerAddress,
      keys:
        proxy === undefined
          ? []
          : [
              {
                expiresAt,
                proxy: expectEvmAddress(proxy),
              },
            ],
    };
  });
  const del = vi.fn(
    async (
      _path: string,
      request: {
        json?: {
          op?: {
            args?: {
              proxy?: string;
            };
          };
        };
      },
    ) => {
      const revokedProxy = request.json?.op?.args?.proxy;
      if (revokedProxy !== undefined) revokedProxies.push(revokedProxy);
      if (options.revokeError !== undefined) {
        throw options.revokeError;
      }
      return { status: 'ok' };
    },
  );
  const connect = vi.fn(async () => {
    throw options.connectError ?? new Error('Perps stream setup failed.');
  });
  const client = {
    account: { signer: signerAddress },
    environment: { chainId: production.chainId },
    perps: { del, getWorkflow, post },
    signer: { signTypedData: vi.fn(async () => signature) },
    webSockets: { perpsSession: { connect } },
  } as unknown as BaseSecureClient;

  return {
    client,
    connect,
    del,
    proxy: () => proxy,
    revokedProxies,
  };
}
