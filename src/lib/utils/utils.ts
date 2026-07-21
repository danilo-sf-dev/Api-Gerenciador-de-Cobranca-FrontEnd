// Helpers de sanitizacao reutilizaveis.
export const sanitizeNumeric = (value: string): string => {
  return (value || "").replace(/\D/g, "");
};

export const sanitizeCEP = (value: string): string => {
  return sanitizeNumeric(value);
};

// Máscaras para campos
export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
};

export const maskCelular = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    .slice(0, 15);
};

export const maskMoeda = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d)(\d{2})$/, "$1,$2")
    .replace(/(?=(\d{3})+(\D))\B/g, ".")
    .replace(/^/, "R$ ");
};

export const maskCEP = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
};

// Validações
export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, "");

  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCelular = (celular: string): boolean => {
  const celularLimpo = sanitizeNumeric(celular);

  // Deve ter 11 dígitos (DDD + 9 + número)
  if (celularLimpo.length !== 11) return false;

  // Deve começar com 9 após o DDD
  if (celularLimpo.charAt(2) !== "9") return false;

  return true;
};

// Função para formatar CPF para exibição
export const formatCPF = (cpf: string): string => {
  if (!cpf) return "";
  const cpfLimpo = sanitizeNumeric(cpf);
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

// Função para formatar celular para exibição
export const formatCelular = (celular: string): string => {
  if (!celular) return "";
  const celularLimpo = sanitizeNumeric(celular);
  return celularLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

// Função para formatar moeda para exibição
export const formatMoeda = (valor: string | number): string => {
  if (!valor) return "R$ 0,00";
  const numero = parseFloat(valor.toString());
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

// Função para formatar CEP para exibição
export const formatCEP = (cep: string): string => {
  if (!cep) return "";
  const cepLimpo = sanitizeCEP(cep);
  return cepLimpo.replace(/(\d{5})(\d{3})/, "$1-$2");
};

// Função para formatar data para exibição
export const formatData = (data: Date | string): string => {
  if (!data) return "";
  const dataObj = typeof data === "string" ? new Date(data) : data;
  return dataObj.toLocaleDateString("pt-BR");
};

// Função para formatar data e hora para exibição
export const formatDataHora = (data: Date | string): string => {
  if (!data) return "";
  const dataObj = typeof data === "string" ? new Date(data) : data;
  return dataObj.toLocaleString("pt-BR");
};

// Função para formatar número para exibição
export const formatNumero = (numero: number | string): string => {
  if (!numero) return "0";
  const num = typeof numero === "string" ? parseFloat(numero) : numero;
  return num.toLocaleString("pt-BR");
};

// Função para formatar peso para exibição
export const formatPeso = (peso: number | string): string => {
  if (!peso) return "0 kg";
  const num = typeof peso === "string" ? parseFloat(peso) : peso;
  return `${num.toLocaleString("pt-BR")} kg`;
};

// Função para formatar distância para exibição
export const formatDistancia = (distancia: number | string): string => {
  if (!distancia) return "0 km";
  const num = typeof distancia === "string" ? parseFloat(distancia) : distancia;
  return `${num.toLocaleString("pt-BR")} km`;
};

// Função para formatar placa de veículo
export const maskPlaca = (value: string): string => {
  return value
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7);
};

// Validação de placa de veículo
export const validatePlaca = (placa: string): boolean => {
  const placaLimpa = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  // Formato Mercosul: LWB9390 ou LWB9R90
  const formatoMercosul = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

  return formatoMercosul.test(placaLimpa);
};

// Validação de capacidade
export const validateCapacidade = (capacidade: string): boolean => {
  const num = parseFloat(capacidade);
  return !isNaN(num) && num > 0;
};
