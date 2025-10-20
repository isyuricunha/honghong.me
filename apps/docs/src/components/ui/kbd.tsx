import { cn } from '@repo/ui/utils/cn'

type KbdProps = React.ComponentProps<'kbd'>

const Kbd = (props: KbdProps) => {
  const { className, ...rest } = props

  return (
    <kbd
      data-slot='kbd'
      className={cn(
        'pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none',
        "[&_svg:not([class*='size-'])]:size-3",
        'dark:[[data-slot=tooltip-content]_&]:bg-background/10',
        '[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background',
        className
      )}
      {...rest}
    />
  )
}

type KbdGroupProps = React.ComponentProps<'div'>

const KbdGroup = (props: KbdGroupProps) => {
  const { className, ...rest } = props

  return <kbd data-slot='kbd-group' className={cn('inline-flex items-center gap-1', className)} {...rest} />
}

export { Kbd, KbdGroup }
