export function formatTokens(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return `${Number.isInteger(millions) ? millions : parseFloat(millions.toFixed(1))}M`
  }
  if (value >= 1_000) {
    const thousands = value / 1_000
    return `${Number.isInteger(thousands) ? thousands : parseFloat(thousands.toFixed(1))}K`
  }
  return `${value}`
}

export function formatPrice(value: number): string {
  if (Number.isInteger(value)) {
    return `$${value.toFixed(2)}`
  }
  if (value >= 1) {
    return `$${value.toFixed(2)}`
  }
  if (value * 100 === Math.round(value * 100)) {
    return `$${value.toFixed(2)}`
  }
  if (value * 1000 === Math.round(value * 1000)) {
    return `$${value.toFixed(3)}`
  }
  return `$${value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '.00')}`
}
