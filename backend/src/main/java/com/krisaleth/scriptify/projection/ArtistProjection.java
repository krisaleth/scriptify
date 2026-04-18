package com.krisaleth.scriptify.projection;

public interface ArtistProjection {
    Long getId();
    String getName();
    String getImageUrl();
    Long getTotalViews(); // Tên phải khớp chính xác với alias 'as totalViews' trong Query
}