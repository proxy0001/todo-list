
export interface IsShowProps {
  active: boolean,
  children: React.ReactNode,
}

export const IsShow = ({ active = true, children }: IsShowProps) => {
  return (
    <>
      { active ? children : null }
    </>
  )
}

export default IsShow