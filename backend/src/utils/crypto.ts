import crypto from 'crypto';

export const generateRandomBytes = (size: number = 32): Buffer => {
  return crypto.randomBytes(size);
};

export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateRandomNumber = (min: number = 0, max: number = 1000000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const generateToken = (length: number = 32): string => {
  return generateRandomString(length);
};

export const hashData = (data: string, algorithm: string = 'sha256'): string => {
  return crypto.createHash(algorithm).update(data).digest('hex');
};

export const hmacHash = (data: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

export const encrypt = (text: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (text: string, key: string): string => {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const generateKey = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateRSAKeyPair = (): { publicKey: string; privateKey: string } => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  return { publicKey, privateKey };
};

export const encryptRSA = (text: string, publicKey: string): string => {
  const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(text));
  return encrypted.toString('base64');
};

export const decryptRSA = (text: string, privateKey: string): string => {
  const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(text, 'base64'));
  return decrypted.toString();
};

export const signData = (data: string, privateKey: string): string => {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'base64');
};

export const verifySignature = (data: string, signature: string, publicKey: string): boolean => {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'base64');
};

export const generateUUID = (): string => {
  return crypto.randomUUID();
};

export const generateShortId = (): string => {
  return crypto.randomBytes(8).toString('hex');
};

export const compareTimingSafe = (a: string, b: string): boolean => {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};