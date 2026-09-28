import React from "react";
import "@/assets/styles/components/common/Pagination.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  totalPages: propTotalPages,
  pageSize = 15,
  onPageChange,
  showInfo = true,
  className = "",
}) {
  const { isEn } = useLanguage();
  const calculatedTotalPages = Math.ceil(totalItems / pageSize);
  const totalPages = propTotalPages !== undefined ? propTotalPages : calculatedTotalPages;

  if (totalPages <= 1) {
    return null;
  }

  const effectiveTotal = totalItems > 0 ? totalItems : totalPages * pageSize;
  const startItem = Math.min((currentPage - 1) * pageSize + 1, effectiveTotal);
  const endItem = Math.min(currentPage * pageSize, effectiveTotal);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  const handlePageClick = (page) => {
    if (page === "..." || page === currentPage || page < 1 || page > totalPages) {
      return;
    }
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className={`ml-pagination-wrap ${className}`}>
      {showInfo && (
        <div className="ml-pagination-info">
          {isEn ? (
            <>
              Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of{" "}
              <strong>{effectiveTotal}</strong> items (Page <strong>{currentPage}</strong>/
              <strong>{totalPages}</strong>)
            </>
          ) : (
            <>
              Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trong{" "}
              <strong>{effectiveTotal}</strong> mục (Trang <strong>{currentPage}</strong>/
              <strong>{totalPages}</strong>)
            </>
          )}
        </div>
      )}

      <nav className="ml-pagination-nav" aria-label="Pagination">
        <button
          type="button"
          className="ml-pagination-btn ml-pagination-btn--prev"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          title={isEn ? "Previous page" : "Trang trước"}
        >
          ‹ {isEn ? "Prev" : "Trước"}
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="ml-pagination-ellipsis">
                •••
              </span>
            );
          }
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              className={`ml-pagination-btn ${isActive ? "active" : ""}`}
              onClick={() => handlePageClick(p)}
              aria-current={isActive ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          className="ml-pagination-btn ml-pagination-btn--next"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          title={isEn ? "Next page" : "Trang sau"}
        >
          {isEn ? "Next" : "Sau"} ›
        </button>
      </nav>
    </div>
  );
}
