import Loader from '@/components/common/Loader';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-white">
      <Loader />
    </div>
  );
}
