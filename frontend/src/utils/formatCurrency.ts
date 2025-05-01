export const formatRupiah = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  export const parseRupiah = (formattedValue: string): number => {
    // Remove all non-digit characters
    const numericString = formattedValue.replace(/\D/g, '');
    return parseInt(numericString) || 0;
  };