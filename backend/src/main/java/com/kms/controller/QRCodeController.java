package com.kms.controller;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.kms.model.Document;
import com.kms.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/qr")
@Tag(name = "QR Code", description = "Generate QR codes for document verification")
public class QRCodeController {

    private final DocumentService documentService;
    private static final String FRONTEND_BASE = "https://knowledge-management-system-nu.vercel.app";

    public QRCodeController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping(value = "/{documentId}", produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "Generate QR code PNG for a document (links to public verify page with hash pre-filled)")
    public ResponseEntity<byte[]> getQRCode(@PathVariable Long documentId,
                                             @RequestParam(defaultValue = "200") int size) throws Exception {
        Document doc = documentService.getDocumentEntityById(documentId);
        String url = FRONTEND_BASE + "/verify?hash=" + doc.getSha256Hash();

        QRCodeWriter writer = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = Map.of(
            EncodeHintType.MARGIN, 1,
            EncodeHintType.CHARACTER_SET, "UTF-8"
        );
        BitMatrix matrix = writer.encode(url, BarcodeFormat.QR_CODE,
            Math.max(100, Math.min(500, size)),
            Math.max(100, Math.min(500, size)), hints);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(
            matrix, "PNG", out,
            new MatrixToImageConfig(0xFF0F172A, 0xFFFFFFFF)  // dark navy on white
        );

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"qr-" + documentId + ".png\"")
            .body(out.toByteArray());
    }

    @GetMapping(value = "/{documentId}/base64")
    @Operation(summary = "Get QR code as base64 data URI (for embedding in frontend)")
    public ResponseEntity<Map<String, String>> getQRCodeBase64(@PathVariable Long documentId,
                                                                @RequestParam(defaultValue = "200") int size) throws Exception {
        Document doc = documentService.getDocumentEntityById(documentId);
        String url = FRONTEND_BASE + "/verify?hash=" + doc.getSha256Hash();

        QRCodeWriter writer = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = Map.of(
            EncodeHintType.MARGIN, 1,
            EncodeHintType.CHARACTER_SET, "UTF-8"
        );
        int qrSize = Math.max(100, Math.min(500, size));
        BitMatrix matrix = writer.encode(url, BarcodeFormat.QR_CODE, qrSize, qrSize, hints);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(
            matrix, "PNG", out,
            new MatrixToImageConfig(0xFF0F172A, 0xFFFFFFFF)
        );

        String base64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(out.toByteArray());
        return ResponseEntity.ok(Map.of(
            "qrCode", base64,
            "verifyUrl", url,
            "documentId", String.valueOf(documentId),
            "sha256Hash", doc.getSha256Hash()
        ));
    }
}
