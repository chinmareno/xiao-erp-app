import { Plus } from "lucide-react";

type Props = {
  label: string;
};

const AddButton = ({ label }: Props) => {
  return (
    <div className="inline-flex items-center px-4 py-2 gap-2 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700">
      <Plus className="mr-2 h-4 w-4" />
      <span>{label}</span>
    </div>
  );
};

export default AddButton;
