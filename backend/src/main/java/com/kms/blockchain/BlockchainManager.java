package com.kms.blockchain;

import java.util.List;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class BlockchainManager {

    private final Blockchain blockchain;

    public BlockchainManager() {
        this.blockchain = new Blockchain();
    }

    public Block storeDocumentHash(String documentHash, String documentId, String uploadedBy) {
        return blockchain.addBlock(documentHash, documentId, uploadedBy);
    }

    public boolean verifyDocument(String documentId, String currentHash) {
        return blockchain.verifyDocument(documentId, currentHash);
    }

    public String getStoredHash(String documentId) {
        return blockchain.findHashByDocumentId(documentId);
    }

    public Block getBlockByDocumentId(String documentId) {
        return blockchain.findBlockByDocumentId(documentId);
    }

    public boolean isChainValid() {
        return blockchain.isChainValid();
    }

    public int getChainSize() {
        return blockchain.getSize();
    }

    public java.util.List<Block> getFullChain() {
        return blockchain.getChain();
    }

    public static String generateSHA256(byte[] fileBytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(fileBytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate SHA-256 hash", e);
        }
    }
}
