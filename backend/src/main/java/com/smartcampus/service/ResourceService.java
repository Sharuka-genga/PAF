package com.smartcampus.service;

import com.cloudinary.Cloudinary;
import com.smartcampus.dto.request.AvailabilityWindowRequest;
import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.dto.response.AvailabilityWindowResponse;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.DayOfWeek;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final Cloudinary cloudinary;

    private String uploadToCloudinary(MultipartFile image) {
        if (image == null || image.isEmpty()) return null;
        log.info("Uploading image to Cloudinary: name={}, size={}, type={}",
                image.getOriginalFilename(), image.getSize(), image.getContentType());
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("folder", "smartcampus/resources");
            Map<?, ?> result = cloudinary.uploader().upload(image.getBytes(), options);
            String url = (String) result.get("secure_url");
            log.info("Cloudinary upload success: {}", url);
            return url;
        } catch (Exception ex) {
            log.error("Cloudinary upload failed", ex);
            throw new RuntimeException("Image upload failed: " + ex.getMessage(), ex);
        }
    }

    public void deleteImage(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
        String imageUrl = resource.getImageUrl();
        if (imageUrl != null) {
            try {
                // Extract public_id from Cloudinary URL: .../upload/v123/folder/name.ext → folder/name
                String afterUpload = imageUrl.substring(imageUrl.indexOf("/upload/") + 8);
                if (afterUpload.startsWith("v") && afterUpload.contains("/")) {
                    afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
                }
                String publicId = afterUpload.contains(".")
                        ? afterUpload.substring(0, afterUpload.lastIndexOf("."))
                        : afterUpload;
                cloudinary.uploader().destroy(publicId, new HashMap<>());
            } catch (Exception ignored) {
                // Best-effort Cloudinary deletion — DB record is cleared regardless
            }
        }
        resource.setImageUrl(null);
        resourceRepository.save(resource);
    }

    public String uploadImage(String id, MultipartFile file) {
        String imageUrl = uploadToCloudinary(file);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
        resource.setImageUrl(imageUrl);
        resourceRepository.save(resource);
        return imageUrl;
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getAll() {
        return resourceRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ResourceResponse getById(String id) {
        return resourceRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
    }

    public List<ResourceResponse> search(String type, Integer minCapacity, String location, String status) {
        ResourceType resourceType = (type != null && !type.isBlank())
                ? ResourceType.valueOf(type.toUpperCase()) : null;
        ResourceStatus resourceStatus = (status != null && !status.isBlank())
                ? ResourceStatus.valueOf(status.toUpperCase()) : null;
        String locationFilter = (location != null && !location.isBlank()) ? location : null;

        return resourceRepository.search(resourceType, minCapacity, locationFilter, resourceStatus)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ResourceResponse create(ResourceRequest request, MultipartFile image) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(request.getStatus())
                .description(request.getDescription())
                .imageUrl(uploadToCloudinary(image))
                .availabilityWindows(
                        request.getAvailabilityWindows() != null
                                ? request.getAvailabilityWindows().stream()
                                        .map(this::toWindowEntity).toList()
                                : List.of())
                .build();
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public ResourceResponse update(String id, ResourceRequest request, MultipartFile image) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setStatus(request.getStatus());
        resource.setDescription(request.getDescription());

        if (image != null && !image.isEmpty()) {
            resource.setImageUrl(uploadToCloudinary(image));
        }

        resource.getAvailabilityWindows().clear();
        if (request.getAvailabilityWindows() != null) {
            resource.getAvailabilityWindows().addAll(
                    request.getAvailabilityWindows().stream()
                            .map(this::toWindowEntity).toList());
        }

        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public ResourceResponse updateStatus(String id, String status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
        resource.setStatus(ResourceStatus.valueOf(status.toUpperCase()));
        return toResponse(resourceRepository.save(resource));
    }

    public void delete(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource", "id", id);
        }
        resourceRepository.deleteById(id);
    }

    private AvailabilityWindow toWindowEntity(AvailabilityWindowRequest r) {
        return AvailabilityWindow.builder()
                .dayOfWeek(DayOfWeek.valueOf(r.getDayOfWeek().toUpperCase()))
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .build();
    }

    private AvailabilityWindowResponse toWindowResponse(AvailabilityWindow w) {
        return AvailabilityWindowResponse.builder()
                .dayOfWeek(w.getDayOfWeek().name())
                .startTime(w.getStartTime())
                .endTime(w.getEndTime())
                .build();
    }

    private ResourceResponse toResponse(Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .status(r.getStatus())
                .description(r.getDescription())
                .imageUrl(r.getImageUrl())
                .availabilityWindows(
                        r.getAvailabilityWindows() != null
                                ? r.getAvailabilityWindows().stream()
                                        .map(this::toWindowResponse).toList()
                                : List.of())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
