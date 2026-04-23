import { useEffect, useMemo, useState } from 'react'
import { getAvailableCampaigns, getCurrentCampaign } from '../api/applicationsApi'
import { getAuthSession } from '../utils/authSessionStorage'

export function useCampaignAccess() {
  const session = getAuthSession()
  const [hasActiveCampaign, setHasActiveCampaign] = useState<boolean | null>(null)
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadCampaign() {
      try {
        const campaign = await getCurrentCampaign()
        const fallbackCampaign =
          campaign ??
          (session?.principalType === 'EMPLOYEE'
            ? await getLastCompletedCampaign().catch(() => null)
            : null)

        if (isMounted) {
          setHasActiveCampaign(Boolean(campaign?.isActive))
          setCurrentCampaignId(campaign?.id ?? fallbackCampaign?.id ?? null)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getErrorMessage(loadError))
        }
      }
    }

    void loadCampaign()

    return () => {
      isMounted = false
    }
  }, [])

  const isAdmin = session?.userRole === 'ADMIN'

  return useMemo(
    () => ({
      campaignError: error,
      currentCampaignId,
      hasActiveCampaign,
      isAdmin,
      isReadOnly: hasActiveCampaign === false && !isAdmin,
    }),
    [currentCampaignId, error, hasActiveCampaign, isAdmin],
  )
}

async function getLastCompletedCampaign() {
  const campaigns = await getAvailableCampaigns()
  const now = Date.now()

  return (
    [...campaigns]
      .filter((campaign) => !campaign.isActive && new Date(campaign.endsAt).getTime() <= now)
      .sort(
        (left, right) =>
          new Date(right.endsAt).getTime() - new Date(left.endsAt).getTime(),
      )[0] ?? null
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось получить данные о текущей кампании'
}
