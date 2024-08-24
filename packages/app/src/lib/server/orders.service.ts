import type { EventCoordinates } from "$lib/interfaces"
import { getEventCoordinates } from "$lib/utils"
import type { NostrEvent } from "@nostr-dev-kit/ndk"
import { orderEventSchema, stallEventSchema } from "../../schema/nostr-events"

export const createOrder = async (orderEvent: NostrEvent) => {
    const { coordinates, tagD } = getEventCoordinates(orderEvent) as EventCoordinates

    const { data, success } = orderEventSchema.safeParse({
        id: coordinates,
        ...JSON.parse(orderEvent.content),
    })
    console.log(data, success)

    if (!success) throw Error(`Invalid stall event data`)
}