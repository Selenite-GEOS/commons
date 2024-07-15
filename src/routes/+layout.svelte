<script lang="ts">
    import '../app.css'
</script>
<main>
<slot/>
</main>

<style>
    main {
        height: 100%;
        width: 100%;
        display: grid;
        gap: 1rem;
        justify-items: center;
        align-items: center;
        align-content: center;
    }
</style>