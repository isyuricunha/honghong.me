import { Checkbox } from '@tszhong0411/ui/components/checkbox'
import { Label } from '@tszhong0411/ui/components/label'

const CheckboxDisabledDemo = () => {
  return (
    <div className='flex items-center gap-2'>
      <Checkbox id='terms-2' disabled />
      <Label htmlFor='terms-2'>Accept terms and conditions</Label>
    </div>
  )
}

export default CheckboxDisabledDemo
