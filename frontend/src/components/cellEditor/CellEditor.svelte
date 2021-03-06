<script>
  import Icon from '@ui/Icon.svelte'
  import Dropdown from '@ui/Dropdown.svelte'
  import Button from '@ui/Button.svelte'
  import Tabs from '@ui/Tabs.svelte'
  import { createEventDispatcher } from 'svelte'
  import { fly } from 'svelte/transition'
  import Editor from '@api/editor'
  import Schedule from '@api/schedule'
  import { stores } from '@sapper/app'
  import { sampleLesson } from '@/consts/schedule-sample'
  import CellSubgroup from './CellSubgroup.svelte'

  const { session } = stores()

  const dispatch = createEventDispatcher()

  const editor = new Editor(fetch, $session)
  const schedule = new Schedule(fetch, $session)

  export let edit
  export let semester

  let currentEdit
  let activeSubgroup
  let activeSubgroups
  let cell

  function updateSubgroups() {
    activeSubgroups = cell
      ? cell.subCells.map((s) => ({
          name: s.subGroup && s.subGroup.name,
          id: s.subGroup && s.subGroup.id,
        }))
      : []
  }
  function updateCell() {
    if (edit === currentEdit) return

    currentEdit = edit
    cell = edit.schedule.cells[0]

    updateSubgroups()

    if (!cell || cell.subCells.length === 0) return

    activeSubgroup = activeSubgroups[0].id

    cell.subCells = cell.subCells.map((subCell) => {
      if (subCell.lessons && subCell.lessons.length) return subCell

      return {
        ...subCell,
        lessons: [sampleLesson],
      }
    })
  }

  $: {
    if (edit) {
      updateCell()
    }
  }

  function addSubgroup({ detail }) {
    if (!cell) {
      cell = {
        subCells: [],
      }
    }

    cell.subCells = [
      ...cell.subCells,
      { subGroup: detail, lessons: [sampleLesson] },
    ]

    activeSubgroup = detail.id

    updateSubgroups()
  }

  let subGroups = []
  async function fetchCellData(groupId) {
    const [subGroupsData] = await Promise.all([
      editor.subgroups(groupId, semester),
    ])
    if (!subGroupsData) return
    subGroups = subGroupsData
  }

  $: {
    fetchCellData(edit.group)
  }

  let subCell = {
    set value(val) {
      let active = cell.subCells.find((s) => s.id === activeSubgroup)
      active = val
    },
    get value() {
      if (!cell || !cell.subCells) return
      return cell.subCells.find((s) => s.subGroup.id === activeSubgroup)
    },
  }
  async function save() {
    const data = {
      day: edit.day.day,
      order: edit.time.order,
      subCells: cell.subCells.map((sub) => ({
        subGroupId: sub.subGroup.id,
        lessons: sub.lessons
          .map((lesson) => {
            if (!lesson.discipline.id) return null
            return {
              periodicity: lesson.periodicity,
              disciplineId: lesson.discipline.id,
              professorId: lesson.professor.id,
              roomId: lesson.room.id,
              lessonType: 'lec',
              importanceStatus: 'low',
            }
          })
          .filter((s) => s !== null),
      })),
    }
    await schedule.insertLessons(edit.schedule.id, data)
    dispatch('update')
  }
</script>

<div class="cell-editor" transition:fly={{ x: 20 }}>
  <div class="back" on:click={() => dispatch('close')}>
    <Icon name="left-arrow" />
    <span>Назад</span>
  </div>

  <div class="tabs">
    <Tabs
      canAddTab={false}
      bind:tabs={activeSubgroups}
      bind:value={activeSubgroup}
      canClose={true}
      displayKey="name"
    />
    <div class="add">
      <Dropdown
        options={subGroups}
        placeholder="Добавить подгруппу"
        displayKey="name"
        on:update={addSubgroup}
      />
    </div>
  </div>

  {#if subCell.value}
    {#key activeSubgroup}
      <CellSubgroup
        bind:subCell={subCell.value}
        groupName={edit.schedule.group.name}
        {semester}
        on:save={save}
      />
    {/key}
  {/if}

  <div class="save">
    <Button on:click={save}>Сохранить</Button>
  </div>
</div>

<style lang="scss">
  .cell-editor {
    position: fixed;
    right: 0px;
    width: 600px;
    top: 0px;
    display: flex;
    flex-direction: column;
    height: 100%;
    z-index: 30;
    background-color: var(--white);
    box-shadow: -10px 0px 10px 0px rgba(0, 52, 102, 0.09);
  }
  .back {
    color: var(--text-light);
    cursor: pointer;
    display: inline-block;
    padding: 15px 20px;
    span {
      display: inline-block;
      margin-left: 10px;
    }
  }
  .tabs {
    display: flex;
    align-items: flex-end;
    padding: 0 5px;
    border-bottom: solid 1px #ddeeff;
    .add {
      width: 220px;
      margin-left: 3px;
    }
  }
  .save {
    margin-top: auto;
    padding: 5px 20px;
  }
</style>
