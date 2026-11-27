export type StatusColor = 'gray' | 'indigo' | 'yellow' | 'green' | 'red'

export const statusColorClasses: Record<
  StatusColor,
  {
    background200: string
    text600: string
    text800: string
    border600: string
  }
> = {
  gray: {
    background200: 'bg-gray-200',
    text600: 'text-gray-600',
    text800: 'text-gray-800',
    border600: 'border-gray-600',
  },
  indigo: {
    background200: 'bg-indigo-200',
    text600: 'text-indigo-600',
    text800: 'text-indigo-800',
    border600: 'border-indigo-600',
  },
  yellow: {
    background200: 'bg-yellow-200',
    text600: 'text-yellow-600',
    text800: 'text-yellow-800',
    border600: 'border-yellow-600',
  },
  green: {
    background200: 'bg-green-200',
    text600: 'text-green-600',
    text800: 'text-green-800',
    border600: 'border-green-600',
  },
  red: {
    background200: 'bg-red-200',
    text600: 'text-red-600',
    text800: 'text-red-800',
    border600: 'border-red-600',
  },
}
