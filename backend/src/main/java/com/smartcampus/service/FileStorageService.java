package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation.resolve("profiles"));
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeProfileImage(MultipartFile file, String userId) {
        // Normalize file name
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new BadRequestException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // Check if it's an image
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Only image files are allowed.");
            }

            // Generate a unique file name to avoid collisions
            String extension = "";
            int i = fileName.lastIndexOf('.');
            if (i > 0) {
                extension = fileName.substring(i);
            }
            String newFileName = "profile_" + userId + "_" + UUID.randomUUID().toString() + extension;

            // Copy file to the target location (Replacing existing file if any)
            Path targetLocation = this.fileStorageLocation.resolve("profiles").resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return the relative path/URL
            return "/api/files/profiles/" + newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) return;
        
        try {
            // filePath is like "/uploads/profiles/filename.jpg"
            String fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
            Path targetLocation = this.fileStorageLocation.resolve("profiles").resolve(fileName);
            Files.deleteIfExists(targetLocation);
        } catch (IOException ex) {
            // Log error but don't fail
            System.err.println("Could not delete file: " + filePath);
        }
    }
}
