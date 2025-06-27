import { useForm, useFieldArray } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// 定义表单校验 schema
const schema = Yup.object().shape({
  users: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
    })
  ),
});

type FormValues = {
  users: { name: string; email: string }[];
};

export default function DynamicForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { users: [{ name: '', email: '' }] },
    resolver: yupResolver(schema),
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'users' });

  return (
    <form
      className="p-8 max-w-xl mx-auto bg-white rounded shadow"
      onSubmit={handleSubmit((data) => {
        alert(JSON.stringify(data, null, 2));
      })}
    >
      <h1 className="text-2xl font-bold mb-4">动态用户表单</h1>
      {fields.map((item, index) => (
        <div key={item.id} className="mb-4 p-4 border rounded bg-gray-50 relative">
          <div className="mb-2">
            <input
              className="px-3 py-2 border rounded w-full bg-white"
              placeholder="Name"
              {...register(`users.${index}.name` as const)}
            />
            {errors.users?.[index]?.name && (
              <p className="text-red-500 text-xs mt-1">{errors.users[index]?.name?.message}</p>
            )}
          </div>
          <div className="mb-2">
            <input
              className="px-3 py-2 border rounded w-full bg-white"
              placeholder="Email"
              {...register(`users.${index}.email` as const)}
            />
            {errors.users?.[index]?.email && (
              <p className="text-red-500 text-xs mt-1">{errors.users[index]?.email?.message}</p>
            )}
          </div>
          <button
            type="button"
            className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            删除
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => append({ name: '', email: '' })}
      >
        添加用户
      </button>
      <button
        type="submit"
        className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        提交
      </button>
    </form>
  );
} 