import { useMouse, watchImmediate } from '@vueuse/core'
import { readable } from 'svelte/store'

const mouse = useMouse()

const STATE = {
    x: 0,
    y: 0
}

export default readable(STATE, function start(set) {
    const stopHandler = watchImmediate([mouse.x, mouse.y], ([x, y]) => {
        set({x, y})
    })

    return function stop() {
        stopHandler()
    }
})