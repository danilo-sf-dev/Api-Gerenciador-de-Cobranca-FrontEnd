"use client";

import React, { useState, useEffect, useRef } from "react";
import { SellersService } from "@/features/vendedores/services/sellers.service";
import { Seller } from "@/types";
import { Search, X } from "lucide-react";
import styles from "../ui/ui.module.css";

type SellerSearchSelectProps = {
  value: string; // sellerCode
  onChange: (code: string) => void;
  error?: boolean;
};

export function SellerSearchSelect({ value, onChange, error }: SellerSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize selected seller if value is set
  useEffect(() => {
    async function loadSelected() {
      if (value) {
        try {
          const list = await SellersService.searchSellers(value);
          const matched = list.find((s) => s.code === value);
          if (matched) {
            setSelectedSeller(matched);
            setQuery(`${matched.name} — ${matched.code}`);
          }
        } catch {
          setSelectedSeller(null);
        }
      } else {
        setSelectedSeller(null);
        setQuery("");
      }
    }
    loadSelected();
  }, [value]);

  // Load matching sellers on query change
  useEffect(() => {
    async function fetchSellers() {
      if (!isOpen) return;
      try {
        const matches = await SellersService.searchSellers(selectedSeller ? "" : query);
        setSellers(matches);
      } catch (err) {
        console.error("Error fetching sellers for search", err);
      }
    }

    // Add simple debounce
    const timer = setTimeout(fetchSellers, 150);
    return () => clearTimeout(timer);
  }, [query, isOpen, selectedSeller]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedSeller) {
          setQuery(`${selectedSeller.name} — ${selectedSeller.code}`);
        } else {
          setQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedSeller]);

  const handleSelect = (seller: Seller) => {
    setSelectedSeller(seller);
    onChange(seller.code);
    setQuery(`${seller.name} — ${seller.code}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSeller(null);
    onChange("");
    setQuery("");
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          style={{ paddingRight: 32 }}
          value={query}
          onChange={(e) => {
            if (selectedSeller) setSelectedSeller(null);
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Digite o nome ou código do vendedor..."
        />
        <div
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {selectedSeller ? (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--colors-muted)",
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <Search size={14} style={{ color: "var(--colors-muted)" }} />
          )}
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            backgroundColor: "var(--colors-bg)",
            border: "1px solid var(--colors-border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-alert)",
            zIndex: 200,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {sellers.length === 0 ? (
            <div
              style={{
                padding: 10,
                fontSize: "0.8125rem",
                color: "var(--colors-muted)",
                textAlign: "center",
              }}
            >
              Nenhum vendedor ativo encontrado
            </div>
          ) : (
            sellers.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelect(s)}
                style={{
                  padding: "8px 12px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  backgroundColor: value === s.code ? "var(--colors-surface)" : "transparent",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--colors-surface)")
                }
                onMouseLeave={(e) => {
                  if (value !== s.code) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ fontWeight: 500 }}>{s.name}</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--colors-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Código: {s.code} | CPF: {s.cpf}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
