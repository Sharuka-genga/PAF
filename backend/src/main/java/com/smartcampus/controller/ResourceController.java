package com.smartcampus.controller;

import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getAll() {
        // Temporary test - return empty list to check if endpoint works
        return ResponseEntity.ok(
                ApiResponse.success("Resources retrieved", java.util.List.of()));
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable String id) {
        resourceService.deleteImage(id);
        return ResponseEntity.ok(ApiResponse.success("Image removed", null));
    }

    @PostMapping(value = "/{id}/image", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadImage(
            @PathVariable String id,
            @RequestPart("image") org.springframework.web.multipart.MultipartFile file) {
        String imageUrl = resourceService.uploadImage(id, file);
        return ResponseEntity.ok(java.util.Map.of("imageUrl", imageUrl));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.success("Resource retrieved", resourceService.getById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(
                ApiResponse.success("Search results",
                        resourceService.search(type, minCapacity, location, status)));
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<ApiResponse<ResourceResponse>> createJson(
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Resource created", resourceService.create(request, null)));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ResourceResponse>> createMultipart(
            @RequestParam("data") String dataJson,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) throws com.fasterxml.jackson.core.JsonProcessingException {
        ResourceRequest request = new com.fasterxml.jackson.databind.ObjectMapper().readValue(dataJson, ResourceRequest.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Resource created", resourceService.create(request, image)));
    }

    @PutMapping(value = "/{id}", consumes = "application/json")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateJson(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Resource updated", resourceService.update(id, request, null)));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateMultipart(
            @PathVariable String id,
            @RequestParam("data") String dataJson,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) throws com.fasterxml.jackson.core.JsonProcessingException {
        ResourceRequest request = new com.fasterxml.jackson.databind.ObjectMapper().readValue(dataJson, ResourceRequest.class);
        return ResponseEntity.ok(
                ApiResponse.success("Resource updated", resourceService.update(id, request, image)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateStatus(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> statusMap) {
        String status = statusMap.get("status");
        return ResponseEntity.ok(
                ApiResponse.success("Status updated", resourceService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        resourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted", null));
    }
}
