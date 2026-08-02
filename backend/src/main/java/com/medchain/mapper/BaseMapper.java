package com.medchain.mapper;

public interface BaseMapper<D, E> {
    E toEntity(D dto);
    D toDto(E entity);
}
