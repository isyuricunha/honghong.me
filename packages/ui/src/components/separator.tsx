import { cn } from '@repo/ui/utils/cn'
import { Separator as SeparatorPrimitive } from 'radix-ui'

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>

const Separator = (props: SeparatorProps) => {
  const { className, orientation = 'horizontal', decorative = true, ...rest } = props

  return (
    <SeparatorPrimitive.Root
      data-slot='separator-root'
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        'data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className
      )}
      {...rest}
    />
  )
}

export { Separator }
