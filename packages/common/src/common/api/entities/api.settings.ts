import { NativeAuthSigner } from '../../../utils/native.auth.signer';

export class ApiSettings {
  timeout?: number;
  skipRedirects?: boolean;
  responseType?: 'arraybuffer' | 'json';
  headers?: Record<string, string>;
  nativeAuthSigner?: NativeAuthSigner;
}
