import { Button } from '@tszhong0411/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@tszhong0411/ui/components/card'
import { Input } from '@tszhong0411/ui/components/input'
import { Label } from '@tszhong0411/ui/components/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@tszhong0411/ui/components/tabs'

const TabsDemo = () => {
  return (
    <Tabs defaultValue='account' className='w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='account'>Account</TabsTrigger>
        <TabsTrigger value='password'>Password</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='space-y-1'>
              <Label htmlFor='name'>Name</Label>
              <Input id='name' defaultValue='Pedro Duarte' />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='username'>Username</Label>
              <Input id='username' defaultValue='@peduarte' />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value='password'>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='space-y-1'>
              <Label htmlFor='current'>Current password</Label>
              <Input id='current' type='password' />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='new'>New password</Label>
              <Input id='new' type='password' />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default TabsDemo
