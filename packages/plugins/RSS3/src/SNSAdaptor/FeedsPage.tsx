import { Icons } from '@masknet/icons'
import { ElementAnchor } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { Box, BoxProps, Skeleton, Typography } from '@mui/material'
import { range } from 'lodash-unified'
import { memo, useMemo } from 'react'
import { useI18N } from '../locales/index.js'
import { FeedCard } from './components/index.js'
import { FeedDetailsProvider } from './contexts/FeedDetails.js'
import { FeedOwnerContext, FeedOwnerOptions } from './contexts/index.js'
import { useFeeds } from './hooks/useFeeds.js'

const useStyles = makeStyles()((theme) => ({
    feedCard: {
        marginTop: theme.spacing(2),
    },
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        flexDirection: 'column',
    },
}))

export interface FeedPageProps extends BoxProps {
    address?: string
    tag?: RSS3BaseAPI.Tag.Donation | RSS3BaseAPI.Tag.Social
}

export const FeedsPage = memo(function FeedsPage({ address, tag, ...rest }: FeedPageProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const { Others } = useWeb3State()

    const { feeds, loading, next } = useFeeds(address, tag)

    const { value: name } = useReverseAddress(undefined, address)

    const feedOwner = useMemo((): FeedOwnerOptions | undefined => {
        if (!address) return
        const showDomain = !!name && !!Others?.formatDomainName
        const ownerDisplay = showDomain
            ? Others?.formatDomainName(name)
            : Others?.formatAddress?.(address, 4) ?? address
        return {
            address,
            name,
            ownerDisplay,
        }
    }, [address, name, Others?.formatDomainName])

    if ((loading && !feeds.length) || !feedOwner) {
        return (
            <Box p={2} boxSizing="border-box">
                {range(3).map((i) => (
                    <Box mb={2} key={i}>
                        <Skeleton animation="wave" variant="rectangular" height={125} />
                    </Box>
                ))}
            </Box>
        )
    }
    if (!feeds.length && !loading) {
        const context = tag ? tag : 'activities'
        return (
            <Box className={classes.statusBox} p={2}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" fontWeight={400}>
                    {t.no_data({ context })}
                </Typography>
            </Box>
        )
    }

    return (
        <FeedOwnerContext.Provider value={feedOwner}>
            <FeedDetailsProvider>
                <Box p={2} boxSizing="border-box" {...rest}>
                    {feeds.map((feed, index) => (
                        <FeedCard key={index} className={classes.feedCard} feed={feed} />
                    ))}
                </Box>
                <ElementAnchor callback={next}>{loading ? <LoadingBase /> : null}</ElementAnchor>
            </FeedDetailsProvider>
        </FeedOwnerContext.Provider>
    )
})
