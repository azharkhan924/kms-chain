package com.kms.blockchain;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;

public class Block {

    private int index;
    private String timestamp;
    private String documentHash;
    private String documentId;
    private String uploadedBy;
    private String previousHash;
    private String hash;
    private int nonce;

    public Block(int index, String documentHash, String documentId,
                 String uploadedBy, String previousHash) {
        this.index = index;
        this.documentHash = documentHash;
        this.documentId = documentId;
        this.uploadedBy = uploadedBy;
        this.previousHash = previousHash;
        this.timestamp = Instant.now().toString();
        this.nonce = 0;
        this.hash = mineBlock(2);
    }

    public String calculateHash() {
        String input = index + timestamp + documentHash + documentId +
                       uploadedBy + previousHash + nonce;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error computing block hash", e);
        }
    }

    private String mineBlock(int difficulty) {
        String prefix = "0".repeat(difficulty);
        String minedHash = calculateHash();
        while (!minedHash.startsWith(prefix)) {
            nonce++;
            minedHash = calculateHash();
        }
        return minedHash;
    }

    // Getters
    public int getIndex() { return index; }
    public String getTimestamp() { return timestamp; }
    public String getDocumentHash() { return documentHash; }
    public String getDocumentId() { return documentId; }
    public String getUploadedBy() { return uploadedBy; }
    public String getPreviousHash() { return previousHash; }
    public String getHash() { return hash; }
    public int getNonce() { return nonce; }
}
