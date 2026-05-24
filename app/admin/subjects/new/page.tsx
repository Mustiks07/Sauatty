import { NewSubjectForm } from './NewSubjectForm';

export const metadata = { title: 'Жаңа пән' };

export default function NewSubjectPage() {
  return (
    <div className="p-6 md:p-10 max-w-[640px]">
      <h1 className="sa-display text-[24px] font-semibold tracking-[-0.02em] mb-6">
        Жаңа пән қосу
      </h1>
      <NewSubjectForm />
    </div>
  );
}
