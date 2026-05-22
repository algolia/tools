<template>
  <div
    class="injected-badge"
    :class="`injected-badge--${size}`"
  >
    {{ value }}
  </div>
</template>

<script>
    export default {
        name: 'InjectedItemBadge',
        props: {
            value: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                default: 'card',
                validator: (s) => ['card', 'modal'].includes(s),
            },
        },
    };
</script>

<style scoped>
    .injected-badge {
        font-weight: 600;
        text-transform: uppercase;
        color: #fff;
        background-color: var(--cr-saturn-1);
        border-radius: 999px;
        line-height: 1.2;
    }
    .injected-badge--card {
        font-size: 0.62rem;
        padding: 2px 6px;
        align-self: flex-start;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .injected-badge--modal {
        font-size: 0.7rem;
        padding: 2px 8px;
    }
</style>
