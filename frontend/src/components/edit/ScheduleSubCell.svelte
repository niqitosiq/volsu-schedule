<script>
  export let subcell

  const periodicity = ['alw', 'num', 'den']

  let lessons = []

  $: {
    lessons = subcell.lessons.sort((prev, current) => {
      const currentPeriodIndex = periodicity.findIndex(
        (period) => period === current.periodicity
      )
      const prevPeriodIndex = periodicity.findIndex(
        (period) => period === prev.periodicity
      )
      if (currentPeriodIndex === prevPeriodIndex) {
        return 0
      }
      return currentPeriodIndex > prevPeriodIndex ? -1 : 1
    })
  }

  let marginTop = false
  let marginBottom = false
  $: {
    if (lessons.length === 1) {
      const firstLesson = lessons[0]
      marginTop = firstLesson && firstLesson.periodicity === 'den'
      const lastLesson = lessons[lessons.length - 1]
      marginBottom = lastLesson && lastLesson.periodicity === 'num'
    }
  }
</script>

<div class="subcell" class:marginTop class:marginBottom>
  {#each lessons as lesson}
    <div class="lesson">
      <span class="discipline">
        {lesson.discipline.name}
      </span>
      <div class="footer">
        <span class="professor">
          {lesson.professor.initials}
        </span>
        <span class="room">
          {lesson.room.name}
        </span>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .subcell {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0%;
    min-height: 100px;
    position: relative;
    border-left: solid 1px rgb(235, 235, 235);
    &:first-child {
      border-left: none;
    }
    &.marginBottom {
      &:after {
        content: '';
        min-height: 80px;
        height: 50%;
        width: 100%;
      }
      .lesson {
        border-bottom: solid 1px var(--gray);
      }
    }
    &.marginTop {
      &:before {
        content: '';
        min-height: 80px;
        height: 50%;
        width: 100%;
      }
      .lesson {
        border-top: solid 1px var(--gray);
      }
    }
  }
  .lesson {
    padding: 12px 9px;
    display: flex;
    flex-direction: column;
    background-color: var(--extra-light);
    width: 100%;
    height: 100%;
    min-height: 80px;
    &:nth-child(2n) {
      border-top: solid 1px var(--gray);
    }
  }
  .discipline {
    font-size: 14px;
    font-weight: 600;
  }
  .footer {
    margin-top: auto;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
  }
</style>
