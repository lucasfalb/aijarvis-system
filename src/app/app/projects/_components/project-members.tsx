'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MoreHorizontal, Search } from "lucide-react";
import { getProjectMembers, removeProjectMember, updateMemberRole } from "@/lib/actions/project";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";

interface ProjectMembersProps {
  projectId: string;
}

type Member = {
  user_id: string;
  email: string;
  role: string;
};

export default function ProjectMembers({ projectId }: ProjectMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Member;
    direction: 'asc' | 'desc';
  }>({ key: 'email', direction: 'asc' });

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  async function fetchMembers() {
    try {
      const response = await getProjectMembers(projectId);
      if (!response.success) throw new Error(response.error);

      setMembers((response.members ?? []).map((m: any) => ({
        user_id: m.user_id,
        email: m.email ?? "Unknown",
        role: m.role,
      })));
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      const response = await removeProjectMember(projectId, userId);
      if (!response.success) throw new Error(response.error);

      toast.success("Member removed successfully");
      setMembers(members.filter((m) => m.user_id !== userId));
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  }

  async function handleUpdateRole(userId: string, newRole: 'viewer' | 'editor' | 'admin') {
    try {
      const response = await updateMemberRole(projectId, userId, newRole);
      if (!response.success) throw new Error(response.error);

      toast.success("Role updated successfully");
      setMembers(members.map(m =>
        m.user_id === userId ? { ...m, role: newRole } : m
      ));
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  }

  const sortedAndFilteredMembers = members
    .filter(member =>
      member.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  function handleSort(key: keyof Member) {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Project Members</h3>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('email')}
            >
              Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('role')}
            >
              Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAndFilteredMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No members found.
              </TableCell>
            </TableRow>
          ) : (
            sortedAndFilteredMembers.map((member) => (
              <TableRow key={member.user_id}>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member.user_id, 'viewer')}
                      >
                        Make Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member.user_id, 'editor')}
                      >
                        Make Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member.user_id, 'admin')}
                      >
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemoveMember(member.user_id)}
                      >
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
