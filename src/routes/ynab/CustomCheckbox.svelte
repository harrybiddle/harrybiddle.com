
<script>
    /* Adapted from https://moderncss.dev/pure-css-custom-checkbox-style/ */

    export let checked;
</script>

<style>    
    input {
        /* Add if not using autoprefixer */
        -webkit-appearance: none;
        /* Remove most all native input styles */
        appearance: none;
        /* For iOS < 15 */
        background-color: var(--form-background);
        /* Not removed via appearance */
        margin: 0;
        
        width: 1.15em;
        height: 1.15em;
        transform: translateY(-0.075em);
        border: 0;

        display: inline-grid;
        place-content: center;
    }

    input::before {
        content: "";
        width: 0.65em;
        height: 0.65em;
        clip-path: polygon(0% 65%, 14% 58%, 25% 51%, 34% 41%, 42% 32%, 54% 29%, 62% 35%, 68% 44%, 76% 52%, 89% 56%, 100% 62%, 100% 70%, 85% 67%, 71% 60%, 60% 51%, 54% 42%, 45% 44%, 40% 51%, 33% 60%, 23% 66%, 13% 69%, 0% 73%);
        /* Windows High Contrast Mode */
        background-color: CanvasText;
    }

    input:checked::before {
        clip-path: polygon(100% 45%, 100% 55%, 0% 55%, 0% 45%);
    }
</style>

<input bind:checked type="checkbox" />