package com.esprit.courseservice.service;

import com.esprit.courseservice.exception.BadRequestException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CourseAssetStorageService {

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp", "gif");
    private static final Set<String> PDF_EXTENSIONS = Set.of("pdf");

    private final Path uploadRoot;

    public CourseAssetStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String storeCoverImage(MultipartFile file) {
        return store(file, "course-covers", IMAGE_EXTENSIONS, "image/");
    }

    public String storeChapterPdf(MultipartFile file) {
        return store(file, "course-chapters", PDF_EXTENSIONS, "application/pdf");
    }

    public Path getUploadRoot() {
        return uploadRoot;
    }

    private String store(MultipartFile file, String folder, Set<String> allowedExtensions, String requiredContentTypePrefix) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload.");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        boolean contentTypeAllowed = requiredContentTypePrefix.endsWith("/")
                ? contentType.startsWith(requiredContentTypePrefix)
                : contentType.equals(requiredContentTypePrefix);
        if (!contentTypeAllowed) {
            throw new BadRequestException(requiredContentTypePrefix.equals("application/pdf")
                    ? "Each chapter file must be a PDF."
                    : "The course cover must be an image file.");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = extractExtension(originalName);
        if (!allowedExtensions.contains(extension)) {
            throw new BadRequestException(requiredContentTypePrefix.equals("application/pdf")
                    ? "Only PDF files are allowed."
                    : "Only image files are allowed.");
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path targetDirectory = uploadRoot.resolve(folder).normalize();
        Path targetFile = targetDirectory.resolve(filename).normalize();

        if (!targetFile.startsWith(targetDirectory)) {
            throw new BadRequestException("Invalid file path.");
        }

        try {
            Files.createDirectories(targetDirectory);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new BadRequestException("The file could not be uploaded.");
        }

        return "/uploads/" + folder + "/" + filename;
    }

    private String extractExtension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            return "";
        }
        return filename.substring(index + 1).toLowerCase(Locale.ROOT);
    }
}
