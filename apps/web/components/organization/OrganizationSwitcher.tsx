'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false)
  const { currentOrganization, organizations, switchOrganization } = useOrganization()
  const router = useRouter()
  const t = useTranslations('Organizations')

  const handleSelect = async (organizationId: string) => {
    if (organizationId === 'create') {
      router.push('/dashboard/organizations/new')
    } else {
      await switchOrganization(organizationId)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            {currentOrganization ? (
              <>
                <Avatar className="h-5 w-5">
                  {currentOrganization.logo ? (
                    <AvatarImage src={currentOrganization.logo} alt={currentOrganization.name} />
                  ) : (
                    <AvatarFallback className="text-xs">
                      <Building2 className="h-3 w-3" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="truncate">{currentOrganization.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{t('selectOrganization')}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder={t('searchOrganization')} />
          <CommandList>
            <CommandEmpty>{t('noOrganizationFound')}</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.id}
                  onSelect={() => handleSelect(org.id)}
                >
                  <Avatar className="mr-2 h-5 w-5">
                    {org.logo ? (
                      <AvatarImage src={org.logo} alt={org.name} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        <Building2 className="h-3 w-3" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 truncate">
                    <div className="truncate">{org.name}</div>
                    {org.role && (
                      <div className="text-xs text-muted-foreground">{org.role}</div>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentOrganization?.id === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {organizations.length === 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="create"
                    onSelect={() => handleSelect('create')}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createOrganization')}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}