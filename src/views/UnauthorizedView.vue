<template>
  <div class="page-shell">
    <Card class="max-w-30rem w-full glassy">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-lock"></i>
          <span>Access denied</span>
        </div>
      </template>
      <template #content>
        <p class="text-secondary mb-3">
          You don’t have permissions for this area. Choose a dashboard that matches your role or sign in with a different
          account.
        </p>
        <div class="flex gap-2">
          <Button label="Back to login" severity="secondary" outlined @click="$router.push({ name: 'login' })" />
          <Button label="Go home" icon="pi pi-home" @click="$router.push({ name: 'login' })" />
        </div>
      </template>
    </Card>
  </div>
</template>
