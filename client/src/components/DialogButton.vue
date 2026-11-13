<template>
<v-dialog max-width="340">
    <template v-slot:activator="{ props: activatorProps }">
    <v-btn
        v-bind="activatorProps"
        :prepend-icon
        :append-icon
        :text
        :class="`bg-${bgColor} text-${textColor} ${block ? '' : 'flex-1'}`"
        :elevation
        :block
    />
    </template>

    <template v-slot:default="{ isActive }">
    <slot/>
    </template>
</v-dialog>
</template>

<script setup lang="ts">
defineProps<{
    prependIcon?: string
    appendIcon?:string
    text?: string
    bgColor?: string
    textColor?: string
    elevation?: string | number
    block: boolean
}>()
</script>