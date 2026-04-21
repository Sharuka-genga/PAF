package com.smartcampus.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<ResourceResponse> getAll() {
        return resourceRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

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
    public ResourceResponse create(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(request.getStatus())
                .description(request.getDescription())
                .availabilityWindows(
                        request.getAvailabilityWindows() != null
                                ? request.getAvailabilityWindows().stream()
                                        .map(this::toWindowEntity).toList()
                                : List.of())
                .build();
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public ResourceResponse update(String id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setStatus(request.getStatus());
        resource.setDescription(request.getDescription());

        resource.getAvailabilityWindows().clear();
        if (request.getAvailabilityWindows() != null) {
            resource.getAvailabilityWindows().addAll(
                    request.getAvailabilityWindows().stream()
                            .map(this::toWindowEntity).toList());
        }

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
