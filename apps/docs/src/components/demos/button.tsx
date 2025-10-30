import { Button } from '@repo/ui/components/button'
import { ArrowUpIcon } from 'lucide-react'

const ButtonDemo = () => {
  return (
    <div className='flex flex-wrap items-center gap-2 md:flex-row'>
      <Button variant='outline'>Button</Button>
      <Button variant='outline' size='icon' aria-label='Submit'>
        <ArrowUpIcon />
      </Button>
    </div>
  )
}

export default ButtonDemo
