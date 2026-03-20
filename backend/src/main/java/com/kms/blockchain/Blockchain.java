package com.kms.blockchain;

import java.util.ArrayList;
import java.util.List;

public class Blockchain {

    private final List<Block> chain;
    private static final int DIFFICULTY = 2;

    public Blockchain() {
        chain = new ArrayList<>();
        chain.add(createGenesisBlock());
    }

    private Block createGenesisBlock() {
        return new Block(0, "GENESIS", "GENESIS", "SYSTEM", "0");
    }

    public Block getLatestBlock() {
        return chain.get(chain.size() - 1);
    }

    public Block addBlock(String documentHash, String documentId, String uploadedBy) {
        Block newBlock = new Block(
            chain.size(),
            documentHash,
            documentId,
            uploadedBy,
            getLatestBlock().getHash()
        );
        chain.add(newBlock);
        return newBlock;
    }

    public boolean isChainValid() {
        for (int i = 1; i < chain.size(); i++) {
            Block current = chain.get(i);
            Block previous = chain.get(i - 1);

            if (!current.getHash().equals(current.calculateHash())) {
                return false;
            }
            if (!current.getPreviousHash().equals(previous.getHash())) {
                return false;
            }
        }
        return true;
    }

    public String findHashByDocumentId(String documentId) {
        return chain.stream()
            .filter(b -> documentId.equals(b.getDocumentId()))
            .map(Block::getDocumentHash)
            .findFirst()
            .orElse(null);
    }

    public Block findBlockByDocumentId(String documentId) {
        return chain.stream()
            .filter(b -> documentId.equals(b.getDocumentId()))
            .findFirst()
            .orElse(null);
    }

    public boolean verifyDocument(String documentId, String currentHash) {
        String storedHash = findHashByDocumentId(documentId);
        if (storedHash == null) return false;
        return storedHash.equals(currentHash);
    }

    public List<Block> getChain() {
        return new ArrayList<>(chain);
    }

    public int getSize() {
        return chain.size();
    }
}
