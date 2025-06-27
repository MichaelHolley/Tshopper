<template>
  <UApp>
    <div class="container mx-auto max-w-sm h-svh flex flex-col px-2">
      <NavBar class="mb-2 mt-1" />
      <div class="grow overflow-y-scroll">
        <RouterView />
      </div>
      <TabNavigation />
    </div>
  </UApp>
</template>
