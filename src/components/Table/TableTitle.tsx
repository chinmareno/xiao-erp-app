type Props = {
  title: string;
};

const TableTitle = ({ title }: Props) => {
  return <h2 className="text-center font-semibold capitalize">{title}</h2>;
};

export default TableTitle;
