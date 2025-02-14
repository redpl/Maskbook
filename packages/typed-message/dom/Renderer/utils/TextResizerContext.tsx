import { createContext, useContext, useEffect, useState } from 'react'

export const TextResizeContext = createContext(false)
TextResizeContext.displayName = 'TextResizeContext'
/** @internal */
export function useTextResize(shouldEnable: boolean) {
    const hasTextEnlarge = useContext(TextResizeContext)
    const [element, setElement] = useState<HTMLElement | null>(null)
    const enable = hasTextEnlarge && shouldEnable

    useEffect(() => {
        if (!element || !enable) return

        const updateFontSize = () => {
            const length = Array.from(element.innerText).length
            let fontSize = 1
            if (length < 45) fontSize = 1.5
            else if (length < 80) fontSize = 1.2

            // reset twitter font size to inherit from the root node.
            if (location.href.includes('twitter.com')) fontSize = 1

            element.style.fontSize = `${fontSize}rem`
        }
        updateFontSize()

        // const watcher = new MutationObserver(updateFontSize)
        // watcher.observe(element, { subtree: true, childList: true, characterData: true })
        // return () => watcher.disconnect()
    }, [enable, element])
    return setElement
}
