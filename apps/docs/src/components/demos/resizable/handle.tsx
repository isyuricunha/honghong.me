import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@tszhong0411/ui/components/resizable'

const ResizableHandleDemo = () => {
  return (
    <ResizablePanelGroup
      direction='horizontal'
      className='min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]'
    >
      <ResizablePanel defaultSize={25}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <div className='flex h-full items-center justify-center p-6'>
          <span className='font-semibold'>Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default ResizableHandleDemo
