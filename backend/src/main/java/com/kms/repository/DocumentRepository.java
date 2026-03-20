package com.kms.repository;

import com.kms.model.Document;
import com.kms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUploadedByAndDeletedFalse(User user);

    List<Document> findByDeletedFalse();

    Optional<Document> findByIdAndDeletedFalse(Long id);

    // Version control queries
    List<Document> findByParentDocumentIdAndDeletedFalseOrderByVersionNumberAsc(Long parentDocumentId);

    @Query("SELECT d FROM Document d WHERE (d.id = :rootId OR d.parentDocumentId = :rootId) AND d.deleted = false ORDER BY d.versionNumber ASC")
    List<Document> findAllVersions(@Param("rootId") Long rootId);

    // Expiry queries
    @Query("SELECT d FROM Document d WHERE d.expiryDate IS NOT NULL AND d.expiryDate < :today AND d.status != 'EXPIRED' AND d.deleted = false")
    List<Document> findExpiredDocuments(@Param("today") LocalDate today);

    // Stats queries
    @Query("SELECT COUNT(d) FROM Document d WHERE d.deleted = false")
    long countActive();

    @Query("SELECT COUNT(d) FROM Document d WHERE d.status = 'VERIFIED' AND d.deleted = false")
    long countVerified();

    @Query("SELECT COUNT(d) FROM Document d WHERE d.status = 'TAMPERED' AND d.deleted = false")
    long countTampered();

    @Query("SELECT COUNT(d) FROM Document d WHERE d.status = 'EXPIRED' AND d.deleted = false")
    long countExpired();

    // Category stats
    @Query("SELECT d.category, COUNT(d) FROM Document d WHERE d.deleted = false GROUP BY d.category")
    List<Object[]> countByCategory();

    // Top uploaders
    @Query("SELECT d.uploadedBy, COUNT(d) FROM Document d WHERE d.deleted = false GROUP BY d.uploadedBy ORDER BY COUNT(d) DESC")
    List<Object[]> findTopUploaders();

    // Find by hash (for public verify)
    @Query("SELECT d FROM Document d WHERE d.sha256Hash = :hash AND d.deleted = false")
    Optional<Document> findByHash(@Param("hash") String hash);
}
