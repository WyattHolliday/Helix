export default function SctionHeader({ title }: { title: string }) {
    return (
        <div className="bg-gray-800 text-white p-4">
          <h1 className="text-[36px]">{title}</h1>
        </div>
    );
    }