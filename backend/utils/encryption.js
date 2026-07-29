import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

function getSecretKey() {
    const rawKey = process.env.SECRET_KEY || process.env.JWT_SECRET;
    if (!rawKey) {
        throw new Error('ENCRYPTION_KEY or SECRET_KEY environment variable is not defined.');
    }
    if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
        return Buffer.from(rawKey, 'hex');
    }
    return crypto.createHash('sha256').update(rawKey).digest();
}

export function encrypt(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const key = getSecretKey();
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(encrypted) {
    if (!encrypted) return encrypted;
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getSecretKey();
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}