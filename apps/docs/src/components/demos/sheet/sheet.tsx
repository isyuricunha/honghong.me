import {
  Button,
  Input,
  Label,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@tszhong0411/ui'

const SheetDemo = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className='grid flex-1 auto-rows-min gap-6 px-4'>
          <div className='grid gap-3'>
            <Label htmlFor='sheet-demo-name'>Name</Label>
            <Input id='sheet-demo-name' defaultValue='Pedro Duarte' />
          </div>
          <div className='grid gap-3'>
            <Label htmlFor='sheet-demo-username'>Username</Label>
            <Input id='sheet-demo-username' defaultValue='@peduarte' />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type='submit'>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default SheetDemo
