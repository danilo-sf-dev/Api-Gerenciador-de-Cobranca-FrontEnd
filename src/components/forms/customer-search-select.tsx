"use client";

import React, { useState, useEffect, useRef } from "react";
import { CustomersService } from "@/features/clientes/services/customers.service";
import { Customer } from "@/types";
import { Search, X } from "lucide-react";
import { formatCPF } from "@/lib/formatters/cpf";
import { formatCNPJ } from "@/lib/formatters/cnpj";
import styles from "../ui/ui.module.css";

type CustomerSearchSelectProps = {
  value: string; // customerId
  onChange: (customer: Customer | null) => void;
  error?: boolean;
};

export function CustomerSearchSelect({ value, onChange, error }: CustomerSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all customers on mount
  useEffect(() => {
    async function loadCustomers() {
      try {
        const list = await CustomersService.getActiveCustomerList();
        setCustomers(list);
      } catch (err) {
        console.error("Error fetching customers list", err);
      }
    }
    loadCustomers();
  }, []);

  // Sync selection when value changes externally
  useEffect(() => {
    if (value && customers.length > 0) {
      const matched = customers.find((c) => c.id === value);
      if (matched) {
        setSelectedCustomer(matched);
        setQuery(
          `${matched.name} — ${matched.documentType === "CPF" ? formatCPF(matched.document) : formatCNPJ(matched.document)}`,
        );
      }
    } else if (!value) {
      setSelectedCustomer(null);
      setQuery("");
    }
  }, [value, customers]);

  // Filter customers based on search query
  useEffect(() => {
    if (!isOpen) return;

    if (selectedCustomer) {
      setFilteredCustomers(customers);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(cleanQuery) ||
        c.document.replace(/\D/g, "").includes(cleanQuery.replace(/\D/g, "")),
    );
    setFilteredCustomers(filtered);
  }, [query, customers, isOpen, selectedCustomer]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedCustomer) {
          setQuery(
            `${selectedCustomer.name} — ${selectedCustomer.documentType === "CPF" ? formatCPF(selectedCustomer.document) : formatCNPJ(selectedCustomer.document)}`,
          );
        } else {
          setQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedCustomer]);

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onChange(customer);
    setQuery(
      `${customer.name} — ${customer.documentType === "CPF" ? formatCPF(customer.document) : formatCNPJ(customer.document)}`,
    );
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(null);
    onChange(null);
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
            if (selectedCustomer) {
              setSelectedCustomer(null);
              onChange(null);
            }
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Digite o nome ou CPF/CNPJ do cliente..."
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
          {selectedCustomer ? (
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
          {filteredCustomers.length === 0 ? (
            <div
              style={{
                padding: 10,
                fontSize: "0.8125rem",
                color: "var(--colors-muted)",
                textAlign: "center",
              }}
            >
              Nenhum cliente ativo encontrado
            </div>
          ) : (
            filteredCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelect(c)}
                style={{
                  padding: "8px 12px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  backgroundColor: value === c.id ? "var(--colors-surface)" : "transparent",
                  transition: "background-color 0.15s",
                  borderBottom: "1px solid var(--colors-border)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--colors-surface)")
                }
                onMouseLeave={(e) => {
                  if (value !== c.id) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ fontWeight: 500 }}>{c.name}</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--colors-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {c.documentType}:{" "}
                  {c.documentType === "CPF" ? formatCPF(c.document) : formatCNPJ(c.document)} |
                  Vendedor: {c.sellerName} ({c.sellerCode})
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
