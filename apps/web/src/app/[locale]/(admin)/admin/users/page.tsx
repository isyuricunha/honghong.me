'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { DataTableSkeleton } from '@tszhong0411/ui/components/data-table'
import { useTranslations } from 'next-intl'

import AdminPageHeader from '@/components/admin/admin-page-header'
import UsersTable from '@/components/admin/users-table'
import { useAdminUsersParams } from '@/hooks/use-admin-users-params'
import { orpc } from '@/orpc/client'

const Page = () => {
  const [params] = useAdminUsersParams()
  const { data, isLoading, isError } = useQuery(
    orpc.admin.listAllUsers.queryOptions({ input: params, placeholderData: keepPreviousData })
  )
  const t = useTranslations()

  const isInitialLoading = isLoading && !data

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        title={t('admin.page-header.users.title')}
        description={t('admin.page-header.users.description')}
      />
      {isInitialLoading && <DataTableSkeleton columnCount={4} rowCount={10} filterCount={3} />}
      {isError && <div>{t('admin.table.users.failed-to-fetch-users-data')}</div>}
      {!isInitialLoading && data && (
        <UsersTable data={data.users} pageCount={data.pageCount} roleCounts={data.roleCounts} />
      )}
    </div>
  )
}

export default Page
