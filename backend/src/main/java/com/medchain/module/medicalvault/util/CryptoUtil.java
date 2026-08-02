package com.medchain.module.medicalvault.util;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class CryptoUtil {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;

    private CryptoUtil() {}

    public static byte[] encrypt(byte[] input) throws Exception {
        SecretKeySpec key = getKey();
        byte[] iv = new byte[IV_LENGTH_BYTE];
        new SecureRandom().nextBytes(iv);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));
        byte[] encrypted = cipher.doFinal(input);
        byte[] combined = new byte[IV_LENGTH_BYTE + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, IV_LENGTH_BYTE);
        System.arraycopy(encrypted, 0, combined, IV_LENGTH_BYTE, encrypted.length);
        return combined;
    }

    public static byte[] decrypt(byte[] input) throws Exception {
        SecretKeySpec key = getKey();
        byte[] iv = new byte[IV_LENGTH_BYTE];
        byte[] encrypted = new byte[input.length - IV_LENGTH_BYTE];
        System.arraycopy(input, 0, iv, 0, IV_LENGTH_BYTE);
        System.arraycopy(input, IV_LENGTH_BYTE, encrypted, 0, encrypted.length);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));
        return cipher.doFinal(encrypted);
    }

    public static String sha256(byte[] input) throws Exception {
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(input);
        return Base64.getEncoder().encodeToString(hash);
    }

    private static SecretKeySpec getKey() throws Exception {
        String secret = System.getenv().getOrDefault("MEDCHAIN_AES_KEY", "medchain-secure-key");
        // SHA-256 the secret to always get exactly 32 bytes regardless of input length
        byte[] keyBytes = MessageDigest.getInstance("SHA-256").digest(secret.getBytes());
        return new SecretKeySpec(keyBytes, "AES");
    }
}
